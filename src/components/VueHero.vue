<template>
  <v-flex md3 xs12>
    <v-card height="100%">
      <v-img height="250px" :src="hero.image"></v-img>
      <v-card-title primary-title class="hero-title">
        <div>
          <h3 class="title">{{ hero.name }}</h3>
          <div class="hero-icons">
            <a
              :href="`https://github.com/${hero.github}`"
              target="_blank"
              v-if="hero.github"
            >
              <i class="fab fa-github"></i>
            </a>
            <a
              :href="`https://twitter.com/${hero.twitter}`"
              target="_blank"
              v-if="hero.github"
            >
              <i class="fab fa-twitter"></i>
            </a>
          </div>
        </div>
      </v-card-title>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn icon @click="$emit('deleteHero', hero.name)">
          <v-icon>delete</v-icon>
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-flex>
</template>

<script>
export default {
  props: {
    hero: {
      type: Object,
    },
  },
};
</script>
