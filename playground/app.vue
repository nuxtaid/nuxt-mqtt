<template>
  <div style="max-width: 600px; margin: 2rem auto; font-family: sans-serif;">
    <h1>nuxt-mqtt playground</h1>

    <section>
      <h2>Subscribe</h2>
      <p>Listening on: <code>test/nuxt-mqtt</code></p>
      <p>Last message: <strong>{{ lastMessage || '(waiting...)' }}</strong></p>
    </section>

    <section>
      <h2>Publish</h2>
      <input
        v-model="messageToSend"
        placeholder="Type a message..."
      >
      <button @click="sendMessage">
        Send to test/nuxt-mqtt
      </button>
    </section>
  </div>
</template>

<script setup>
const lastMessage = ref('')
const messageToSend = ref('Hello from nuxt-mqtt!')

const { publish, subscribe } = useMQTT()

subscribe('test/nuxt-mqtt', (msg) => {
  lastMessage.value = msg
})

function sendMessage() {
  publish('test/nuxt-mqtt', messageToSend.value)
}
</script>
