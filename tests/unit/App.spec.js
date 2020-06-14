import { shallowMount, createLocalVue } from '@vue/test-utils'
import VueApollo from 'vue-apollo'
import Vuetify from 'vuetify'
import AppComponent from '@/App.vue'
import { createMockClient } from 'mock-apollo-client'
import allHeroesQuery from '@/graphql/allHeroes.query.gql'
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
  id: '123',
  name: 'New Hero',
  github: '1000-contributions-a-day',
  twitter: 'new-hero',
  image: 'img.jpg',
}

const localVue = createLocalVue()
localVue.use(VueApollo)
localVue.use(Vuetify)

describe('App component', () => {
  let wrapper
  let mockClient
  let apolloProvider

  const createComponent = (handlers) => {
    const requestHandlers = {
      allHeroesQueryHandler: jest.fn().mockResolvedValue(heroListMock),
      addHeroMutationHandler: jest.fn().mockResolvedValue(newHeroMock),
      deleteHeroMutation: jest.fn().mockResolvedValue(true),
      ...handlers,
    }
    mockClient = createMockClient()
    mockClient.setRequestHandler(
      allHeroesQuery,
      requestHandlers.allHeroesQueryHandler
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
})
