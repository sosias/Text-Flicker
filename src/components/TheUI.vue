<script setup>
import { useUiStore } from '@/stores/ui'
import UIWordItem from './UIWordItem.vue'
import { ref } from 'vue';
//import ObsWebSocket from './ObsWebSocket.vue'

const store = useUiStore()

import { onMounted, onBeforeUnmount } from 'vue';

const selectDevice = (deviceIndex) => {
  store.device = deviceIndex
  store.wordIndex = 0
  store.wordList = store.wholeData.data[deviceIndex]
}

onMounted(() => {
  setDeviceFromHash();
})

onBeforeUnmount(() => {

})

window.addEventListener('hashchange', function() {
  setDeviceFromHash()
})

const setDeviceFromHash = () => {
  if(window.location.hash == "#a1"){
    selectDevice(0)
  } else if(window.location.hash == "#a2"){
    selectDevice(1)
  }
}

const updateFittedCheckbox = () => {
  store.fittedText = !store.fittedText
  updateCanvas()
}

const updateBlurCheckbox = () => {
  store.blur = !store.blur
  updateCanvas()
}

const updateCalibrationCheckbox = () => {
  store.calibration = !store.calibration
  if(store.calibration){
    store.fx_sequencePlaying = true
  }
  //updateCanvas()
}

const updateWordListShowCheckbox = () => {
  store.wordListShow = !store.wordListShow
}

const updateCanvas = () => {
  if(!store.isPlaying){
    store.drawOnce()
  }
}

const setWholeData = (data) => {
  store.wholeData = data
  store.wordList  = store.wholeData.data[0]
}

const clearJson = () => {
  localStorage.removeItem("wholeData");
  setWholeData(store.originalData);
}

const fileInput = ref("fileInput");
const importJson = () => {
  fileInput.value.click();
}

const loadJSONFromFile = (event) => {
  const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          let fileContent = JSON.parse(e.target.result)
          setWholeData(fileContent)
          localStorage.setItem("wholeData", e.target.result); // save to local storage
        } catch (error) {
          console.error('Error parsing JSON:', error);
        }
      }
    reader.readAsText(file);
  }
}

const fileVideoInput = ref("fileVideoInput");
const importVideo = () => {
  fileVideoInput.value.click();
}

const loadVideoFromFile = (event) => {
  const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          let fileContent = e.target.result
          saveVideoToDBEntry("1",fileContent)
        } catch (error) {
          console.error('Error getting video:', error);
        }
      }
    reader.readAsDataURL(file)
  }
}

const saveVideoToDBEntry = (idEntry, data) => {
  let db;
  const requestDB = indexedDB.open("textFlickerDB");
  requestDB.onerror = (event) => {
    console.error("Use of IndexedDB isn't allowed");
  };
  requestDB.onsuccess = (event) => {
    db = event.target.result;
    const objectStore = db
      .transaction(["videos"], "readwrite")
      .objectStore("videos");
    const requestObj = objectStore.get(idEntry);
    requestObj.onerror = (event) => {
      // Handle errors!
    };
    requestObj.onsuccess = (event) => {
    
      const entry = event.target.result;
      entry.data = data;
    
      const requestUpdate = objectStore.put(entry);
      requestUpdate.onerror = (event) => {
        // Do something with the error
      };
      requestUpdate.onsuccess = (event) => {
        // Success - the data is updated!
      };
    };
  };
}


</script>

<template>
  <Transition>
    <div class="container_settings" v-if="store.isPanelUIVisible">
      <div class="ui_panel">
        <!-- Websocket address
          <section>
            <ObsWebSocket />
          </section>
          <br/> -->
          <div class="ui_panel__section">
            <fieldset>
              <input type="file" ref="fileInput" v-on:change="loadJSONFromFile" hidden />
              <button class="button" v-on:click="importJson()">Import json</button>
            </fieldset>
            <fieldset>
              <button class="button" v-on:click="clearJson()">Clear json</button>
            </fieldset>
            <fieldset>
              <input type="file" ref="fileVideoInput" v-on:change="loadVideoFromFile" hidden />
              <button class="button" v-on:click="importVideo()">Import video</button>
            </fieldset>
            <fieldset>
              <label>Device</label>
              <div class="input_group">
                <button class="button_ctrl button_ctrl-small" disabled>{{ store.device + 1 }}</button>
              </div>
            </fieldset>
            <!-- <section>
              <button class="button" v-on:click="console.log(JSON.stringify(store.wordList))">Print json</button>
            </section>
            <br /> -->
            <!-- Options -->
            <fieldset class="check-btn">
              <label for="fit">Fit text</label>
              <input id="fit" v-model="store.fittedText" v-on:click="updateFittedCheckbox()" type="checkbox" />
            </fieldset>
            <fieldset class="check-btn">
              <label for="blur">Blur</label>
              <input id="blur" v-model="store.blur" v-on:click="updateBlurCheckbox()" type="checkbox" />
            </fieldset>
            <fieldset class="check-btn">
              <label for="calibration">Init</label>
              <input id="calibration" v-model="store.calibration" v-on:click="updateCalibrationCheckbox()" type="checkbox" />
            </fieldset>
            <fieldset class="check-btn">
              <label for="wordListShow">List</label>
              <input id="wordListShow" v-model="store.wordListShow" v-on:click="updateWordListShowCheckbox()" type="checkbox" />
            </fieldset>
            <input type="range" min="0.0" max="1.0" step="0.000001" v-model=store.fx_divergence />
            <div>v.{{store.wholeData.version}}</div>
        <!-- <br/>
          Step velocity
          <section>
            <input v-model.number="store.stepMilliseconds" type="range" min="1" max="300" class="slider" />
            <input v-model="store.stepMilliseconds" type="number" /><span>ms</span>
          </section> -->
          <!-- <br/>
            Add Random Offset
            <section>
              <input v-model.number="store.randomOffset" type="range" min="0" max="1000" class="slider" />
              <input v-model="store.randomOffset" type="number" /><span>ms</span>
            </section> -->
          </div>
          <section v-if="store.wordListShow" class="wordlist">
            <UIWordItem v-for="(wordItem, index) in store.wordList && store.wordList[store.scene].data" :key="index"
            :on="index == store.wordIndex" :index=index :item=store.wordList[store.scene].data[index] />
          </section>
        </div>
      </div>
  </Transition>
</template>

<style lang="scss" scoped>
$sizeHalf: 47.5px;

.v-enter-active, .v-leave-active {
  transition: opacity 0.3s ease;
}

.v-enter-from, .v-leave-to {
  opacity: 0;
}

.container_settings{
  color: white;
  padding-left: 10px;
  padding-top: 10px;
}
.ui_panel{
  display: flex;
  flex-direction: column;

  &__section{
    display: flex;
    flex-wrap: wrap;
    align-items: flex-end;
    padding-bottom: 12px;
    gap: 5px;

    fieldset label{
        display: block;
      }
  }
}

fieldset {
  padding: 0;
  margin: 0;
  border: none;
}
.input_group{
  display: flex;
  align-items: center;
  gap: 5px;
  align-items: center;
}
.wordlist{
  padding-top: 10px;
  display: flex;
  align-items: center;
  gap: 5px;
  flex-direction: column;
  overflow: auto;
  max-height: 100%;
  scrollbar-width: thin;
  scrollbar-color: #333 #999;
}

fieldset.check-btn{
  display: flex;
  flex-direction: column;
  align-items: center;
}
.check-btn{
  label{
    cursor: pointer;
  }

  input[type="checkbox"] {
    margin: 0;
    padding: 0;
    appearance: none;
    border: 1px solid #999;
  }

  input[type="checkbox"]::before {
    content: "";
    width: $sizeHalf;
    height: $sizeHalf;
    display: block;
  }
  
  input[type="checkbox"]:checked::before {
    background-image: radial-gradient(
      circle at center,
      #fff 1px,
      transparent 0
    );
    background-size: 7.5px 7.5px;
    background-repeat: repeat;
  }

  input[type="checkbox"]:hover {
    cursor: pointer;
    background-image: radial-gradient(
      circle at center,
      #fff 1px,
      transparent 0
    );
    background-size: 15px 15px;
    background-repeat: repeat;
  }
  
}
</style>
