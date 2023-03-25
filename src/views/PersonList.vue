<template>
  <div class="personList">
    <v-list :rounded="true">
      <v-list-item-group color="primary">
        <v-list-item
          :v-if="personList && personList.length"
          v-for="(person, index) in personList"
          :key="`person${index}`"
          v-on:click="openPersonDetail(index)"
        >
          <v-list-item-avatar>
            <v-img width="200" height="200" :src="person.picture"></v-img>
          </v-list-item-avatar>
          <v-list-item-content>
            <v-list-item-title v-html="`${person.name.first} ${person.name.last}`"></v-list-item-title>
            <v-list-item-subtitle v-html="person.email"></v-list-item-subtitle>
          </v-list-item-content>
        </v-list-item>
      </v-list-item-group>
    </v-list>

    <v-dialog v-model="dialog" width="80vw">
      <v-card v-if="showingPerson" height="90vh">
        <v-card-title class="headline grey lighten-2" primary-title>
          <v-container>
            <v-row no-gutters>
              <v-col cols="12" sm="11">Person Detail</v-col>
              <v-col cols="12" sm="1">
                <v-btn class="float-right" icon @click="dialog = false">
                  <v-icon>mdi-close</v-icon>
                </v-btn>
              </v-col>
            </v-row>
          </v-container>
        </v-card-title>

        <GmapMap
          :center="marker"
          :zoom="7"
          map-type-id="terrain"
          style="width: 100%; height: 50%"
          :key="mapKey"
        >
          <GmapMarker :position="marker" :clickable="false" :draggable="true" />
        </GmapMap>

        <div class="detail">
          <v-list-item>
            <v-list-item-avatar tile size="80">
              <v-img width="200" height="200" :src="showingPerson.picture"></v-img>
            </v-list-item-avatar>
            <v-list-item-content>
              <v-list-item-title
                class="headline mb-1"
              >{{showingPerson.name.first}} {{showingPerson.name.last}}</v-list-item-title>
              <v-list-item-subtitle>{{showingPerson.email}}</v-list-item-subtitle>
            </v-list-item-content>
          </v-list-item>
        </div>
      </v-card>
    </v-dialog>
  </div>
</template>



<script lang="ts">
import Vue from "vue";
import Component from "vue-class-component";

import { Person } from "@/model/person";

// Define the component in class-style
@Component
export default class PersonList extends Vue {
  // Class properties will be component data

  overlay = false;
  dialog = false;

  personId = -1 as number;

  mapKey = 0;

  personList = [] as Person[];
  // Methods will be component methods

  get showingPerson() {
    if (this.personId >= 0) {
      return this.personList[this.personId];
    }
    return undefined;
  }

  get marker() {
    if (this.showingPerson) {
      return {
        lat: this.showingPerson.location.latitude || 0,
        lng: this.showingPerson.location.longitude || 0
      };
    }

    return { lat: 0, lng: 0 };
  }


  // force map to render
  forceMapRerender() {
    this.mapKey += 1;
  }

  mounted() {
    this.fetchData();
  }

  async openPersonDetail(index: number) {
    this.personId = index;
    this.dialog = true;

    await this.$nextTick();
  }

  async fetchData() {
    const url = "https://next.json-generator.com/api/json/get/41P1_UhSI";

    const response = await this.$http.get(url);
    this.personList = response.data;
  }
}
</script>