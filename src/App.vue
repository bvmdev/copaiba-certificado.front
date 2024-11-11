<template>
  <v-app>
    <v-app-bar>
      <v-img
        src="https://copaiba.org.br/wp-content/uploads/2021/11/logo.png"
        max-height="50"
        contain
        class="mx-4"
      />
      <v-spacer></v-spacer>
    </v-app-bar>

    <v-main>
      <v-container>
        <router-view></router-view>
      </v-container>
    </v-main>
  </v-app>
</template>

<script setup lang="ts">
</script> 