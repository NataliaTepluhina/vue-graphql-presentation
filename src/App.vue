<template>
  <v-app>
    <v-toolbar color="teal darken-2" dark fixed app>
      <img class="logo" src="./assets/vue-graphql.png" alt="Logo" />
      <v-toolbar-title class="hidden-xs-only">Vue Heroes</v-toolbar-title>
    </v-toolbar>
    <v-content class="teal lighten-3">
      <v-container fluid class="app-container white" fill-height grid-list-md>
        <h2 v-if="queryError" class="test-error">
          Something went wrong. Please try again in a minute
        </h2>
        <div v-else-if="$apollo.queries.allHeroes.loading" class="test-loading">
          Loading...
        </div>
        <template v-else>
          <v-layout class="hero-cards-layout test-heroes-list" wrap>
            <vue-hero
              v-for="hero in allHeroes"
              :hero="hero"
              @deleteHero="deleteHero($event)"
              :key="hero.name"
            ></vue-hero>
            <v-flex md3 xs12 v-if="isSaving">
              <v-card height="100%" class="centered test-saving">
                <v-progress-circular indeterminate></v-progress-circular>
              </v-card>
            </v-flex>
          </v-layout>
          <h3 class="headline test-empty-list" v-if="allHeroes.length === 0">
            No heroes found 😭
          </h3>
          <v-dialog v-model="dialog" width="800">
            <v-btn slot="activator" color="teal" dark>Add Hero</v-btn>
            <v-card class="dialog-form">
              <v-form v-model="valid">
                <v-text-field
                  v-model="name"
                  :rules="nameRules"
                  label="Name"
                  required
                ></v-text-field>
                <v-text-field v-model="image" label="Image Link"></v-text-field>
                <v-text-field v-model="twitter" label="Twitter"></v-text-field>
                <v-text-field v-model="github" label="Github"></v-text-field>
              </v-form>
              <v-card-actions>
                <v-btn :disabled="!valid" @click="addHero">submit</v-btn>
              </v-card-actions>
            </v-card>
          </v-dialog>
        </template>
      </v-container>
    </v-content>
    <v-footer color="teal darken-2" app>
      <span class="footer-text text-xs-center white--text">&copy; 2019</span>
    </v-footer>
  </v-app>
</template>

<script>
import { VApp, VToolbar, VToolbarTitle } from 'vuetify'
import VueHero from './components/VueHero'
import allHeroesQuery from './graphql/allHeroes.query.gql'
import addHeroMutation from './graphql/addHero.mutation.gql'
import deleteHeroMutation from './graphql/deleteHero.mutation.gql'

export default {
  name: 'app',
  data() {
    return {
      valid: false,
      dialog: false,
      name: '',
      nameRules: [(v) => !!v || 'Name is required'],
      image: '',
      github: '',
      twitter: '',
      allHeroes: [],
      isSaving: false,
      queryError: null,
    }
  },
  components: {
    VueHero,
  },
  apollo: {
    allHeroes: {
      query: allHeroesQuery,
      error(e) {
        this.queryError = true
      },
    },
  },
  methods: {
    addHero() {
      const hero = {
        name: this.name,
        image: this.image,
        twitter: this.twitter,
        github: this.github,
      }
      this.dialog = false
      this.name = ''
      this.image = ''
      this.github = ''
      this.twitter = ''
      this.isSaving = true
      this.$apollo
        .mutate({
          mutation: addHeroMutation,
          variables: {
            hero,
          },
          update(store, { data: { addHero } }) {
            const data = store.readQuery({ query: allHeroesQuery })
            data.allHeroes.push(addHero)
            store.writeQuery({ query: allHeroesQuery, data })
          },
        })
        .finally(() => {
          this.isSaving = false
        })
    },
    deleteHero(name) {
      this.$apollo.mutate({
        mutation: deleteHeroMutation,
        variables: {
          name,
        },
        update: (store) => {
          const data = store.readQuery({ query: allHeroesQuery })
          const heroToDelete = data.allHeroes.find((hero) => hero.name === name)
          data.allHeroes.splice(data.allHeroes.indexOf(heroToDelete), 1)
          store.writeQuery({ query: allHeroesQuery, data })
        },
      })
    },
  },
}
</script>

<style lang="scss">
.container.app-container.fluid.fill-height {
  align-items: start;
  max-width: 1240px;
  padding: 30px;
  flex-direction: column;
}

.footer-text {
  padding-left: 20px;
}

.logo {
  display: block;
  max-height: 100%;
  height: 50px;
  box-sizing: border-box;
  border: 1px solid transparent;
}

.dialog-form {
  padding: 15px;
}

.hero-cards-layout {
  width: 100%;
  .v-card__title.hero-title {
    padding-bottom: 0;
  }

  .hero-icons {
    font-size: 24px;
    padding-top: 10px;
    a {
      color: inherit;
      padding-right: 10px;
      &:hover {
        color: teal;
      }
      &:focus,
      &:active {
        color: inherit;
      }
    }
  }
}

.centered {
  display: flex !important;
  justify-content: center;
  align-items: center;
}

@media (max-width: 480px) {
  .logo {
    height: 36px;
    margin-right: 20px;
  }
}
</style>
