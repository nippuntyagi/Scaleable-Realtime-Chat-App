import { Kafka, Producer } from "kafkajs";

const kafka = new Kafka({
    brokers: []
})
let producer: null | Producer = null;

export async function createProducers() {
    if (producer) return producer;
    const _producer = kafka.producer();
    await _producer.connect();
    producer = _producer;
    return producer;
}

export async function produceMessage(message: string) {
    const producer = await createProducers();
    await producer.send({
        messages: [{
            key: `message-${Date.now()}`,
            value: message
        }],
        topic: "MESSAGES"
    });
    return true;
}
export default kafka;