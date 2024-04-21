import { Kafka, Producer } from "kafkajs";
import fs from "fs";
import path from "path";
import prismaClient from "./prisma";

const kafka = new Kafka({
    brokers: [`${process.env.KAFKA_HOST}:${process.env.KAFKA_PORT}`],
    ssl: {ca: [fs.readFileSync(path.resolve("./kafkaca.pem"), "utf-8")]},
    // @ts-ignore
    sasl: {
        // @ts-ignore
        username: process.env.KAFKA_USERNAME,
        // @ts-ignore
        password: process.env.KAFKA_PASSWORD,
        mechanism: 'plain',
    }
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

export async function startMessageConsumer() {
    const consumer = kafka.consumer({groupId: "default"});
    await consumer.connect();
    await consumer.subscribe({topic: "MESSAGES", fromBeginning: true});

    await consumer.run({
        autoCommit: true,
        // autoCommitInterval: 5
        eachMessage: async ({message, pause}) => {
            console.log(`New Message Recv...`)
            if (!message.value) return;
            try{

            } catch(e) {
                console.log('something went wrong');
                pause();
                setTimeout(()=>{
                    consumer.resume([{topic: "MESSAGES"}])
                }, 60*1000)
            }
            await prismaClient.message.create({
                data: {
                    text: message.value?.toString()
                }
            })
        }
    })
}
export default kafka;