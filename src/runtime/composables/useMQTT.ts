export const useMQTT = () => {
  const { $mqtt } = useNuxtApp()

  const publish = (topic: string, message: string | object) => {
    const payload = typeof message === 'string' ? message : JSON.stringify(message)
    $mqtt.publish(topic, payload)
  }

  const subscribe = (
    topic: string,
    cb: (msg: string) => void,
  ) => {
    $mqtt.subscribe(topic)

    const handler = (t: string, payload: Buffer) => {
      if (t === topic) cb(payload.toString())
    }

    $mqtt.on('message', handler)

    return () => $mqtt.off('message', handler)
  }

  return { publish, subscribe }
}
