import { shallowMount, createLocalVue } from '@vue/test-utils'
import VueApollo from 'vue-apollo'
import Vuetify from 'vuetify'
import AppComponent from '@/App.vue'
import { createMockClient } from 'mock-apollo-client'
import allHeroesQuery from '@/graphql/allHeroes.query.gql'
import addHeroMutation from '@/graphql/addHero.mutation.gql'
import deleteHeroMutation from '@/graphql/deleteHero.mutation.gql'
import VueHero from '@/components/VueHero'

const heroListMock = {
  data: {
    allHeroes: [
      {
        github: 'test-github',
        id: '-1',
        image: 'image-link',
        name: 'Anonymous Vue Hero',
        twitter: 'some-twitter',
      },
      {
        github: 'test-github2',
        id: '-2',
        image: 'image-link2',
        name: 'another Vue Hero',
        twitter: 'some-twitter2',
      },
    ],
  },
}

const newHeroMock = {
  name: 'New Hero',
  github: '1000-contributions-a-day',
  twitter: 'new-hero',
  image: 'img.jpg',
}

const newHeroMockResponse = {
  data: {
    addHero: {
      __typename: 'Hero',
      id: '123',
      ...newHeroMock,
    },
  },
}

const localVue = createLocalVue()
localVue.use(VueApollo)
localVue.use(Vuetify)

describe('App component', () => {
  let wrapper
  let mockClient
  let apolloProvider
  let requestHandlers

  const createComponent = (handlers) => {
    requestHandlers = {
      allHeroesQueryHandler: jest.fn().mockResolvedValue(heroListMock),
      addHeroMutationHandler: jest.fn().mockResolvedValue(newHeroMockResponse),
      deleteHeroMutationHandler: jest
        .fn()
        .mockResolvedValue({ data: { deleteHero: true } }),
      ...handlers,
    }
    mockClient = createMockClient()
    mockClient.setRequestHandler(
      allHeroesQuery,
      requestHandlers.allHeroesQueryHandler
    )
    mockClient.setRequestHandler(
      addHeroMutation,
      requestHandlers.addHeroMutationHandler
    )
    mockClient.setRequestHandler(
      deleteHeroMutation,
      requestHandlers.deleteHeroMutationHandler
    )

    apolloProvider = new VueApollo({
      defaultClient: mockClient,
    })
    wrapper = shallowMount(AppComponent, {
      localVue,
      apolloProvider,
    })
  }

  afterEach(() => {
    wrapper.destroy()
    mockClient = null
    apolloProvider = null
  })

  it('renders a loading block when query is in progress', () => {
    createComponent()

    expect(wrapper.find('.test-loading').exists()).toBe(true)
    expect(wrapper.html()).toMatchSnapshot()
  })

  it('renders a list of two heroes when query is resolved', async () => {
    createComponent()

    await wrapper.vm.$nextTick()

    expect(wrapper.find('.test-loading').exists()).toBe(false)
    expect(wrapper.html()).toMatchSnapshot()
    expect(wrapper.findAllComponents(VueHero)).toHaveLength(2)
  })

  it('renders a message about no heroes when heroes list is empty', async () => {
    createComponent({
      allHeroesQueryHandler: jest
        .fn()
        .mockResolvedValue({ data: { allHeroes: [] } }),
    })

    await wrapper.vm.$nextTick()

    expect(wrapper.find('.test-loading').exists()).toBe(false)
    expect(wrapper.html()).toMatchSnapshot()
    expect(wrapper.find('.test-empty-list').exists()).toBe(true)
  })

  it('renders error if query fails', async () => {
    createComponent({
      allHeroesQueryHandler: jest
        .fn()
        .mockRejectedValue(new Error('GraphQL error')),
    })

    await wrapper.vm.$nextTick()
    await wrapper.vm.$nextTick()

    expect(wrapper.find('.test-loading').exists()).toBe(false)
    expect(wrapper.html()).toMatchSnapshot()
    expect(wrapper.find('.test-error').exists()).toBe(true)
  })

  it('adds a new hero to cache on addHero mutation', async () => {
    createComponent()
    wrapper.setData({
      ...newHeroMock,
    })

    await wrapper.vm.$nextTick()
    wrapper.vm.addHero()

    expect(requestHandlers.addHeroMutationHandler).toHaveBeenCalledWith({
      hero: {
        ...newHeroMock,
      },
    })

    await wrapper.vm.$nextTick()

    expect(
      mockClient.cache.readQuery({ query: allHeroesQuery }).allHeroes
    ).toHaveLength(3)

    await wrapper.vm.$nextTick()

    expect(wrapper.html()).toMatchSnapshot()
    expect(wrapper.findAllComponents(VueHero)).toHaveLength(3)
  })

  it('deletes a hero from cache correctly', async () => {
    createComponent()

    await wrapper.vm.$nextTick()

    wrapper
      .findAllComponents(VueHero)
      .at(0)
      .vm.$emit('deleteHero', heroListMock.data.allHeroes[0].name)

    expect(requestHandlers.deleteHeroMutationHandler).toHaveBeenCalledWith({
      name: 'Anonymous Vue Hero',
    })

    await wrapper.vm.$nextTick()

    expect(
      mockClient.cache.readQuery({ query: allHeroesQuery }).allHeroes
    ).toHaveLength(1)
    expect(
      mockClient.cache
        .readQuery({ query: allHeroesQuery })
        .allHeroes.some((hero) => hero.name === 'Anonymous Vue Hero')
    ).toBe(false)

    await wrapper.vm.$nextTick()

    expect(wrapper.html()).toMatchSnapshot()
    expect(wrapper.findAllComponents(VueHero)).toHaveLength(1)
  })
})
