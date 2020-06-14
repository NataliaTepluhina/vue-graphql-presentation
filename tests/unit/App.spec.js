import { shallowMount, createLocalVue } from '@vue/test-utils'
import VueApollo from 'vue-apollo'
import AppComponent from '@/App.vue'
import { createMockClient } from 'mock-apollo-client'
import allHeroesQuery from '@/graphql/allHeroes.query.gql'

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

describe('App component', () => {
  let wrapper
  let mockClient
  let apolloProvider

  const createComponent = (
    requestHandlers = {
      allHeroesQueryHandler: jest.fn().mockResolvedValue(heroListMock),
      addHeroMutationHandler: jest.fn().mockResolvedValue(newHeroMock),
      deleteHeroMutation: jest.fn().mockResolvedValue(true),
    }
  ) => {
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

  it('renders a list of two characters', () => {
    createComponent()

    expect(wrapper.html).toMatchSnapshot()
  })
})
