import { Server } from 'socket.io';
import Redis from 'ioredis';

// @ts-ignore
const pub = new Redis({
    host: process.env.REDIS_HOST,
    port: process.env.REDIS_PORT,
    username: process.env.REDIS_USERNAME,
    password: process.env.REDIS_PASSWORD
});
// @ts-ignore
const sub = new Redis({
    host: process.env.REDIS_HOST,
    port: process.env.REDIS_PORT,
    username: process.env.REDIS_USERNAME,
    password: process.env.REDIS_PASSWORD
});


class SocketService {
    private _io: Server;
    constructor() {
        console.log('Init Socket services...')
        this._io = new Server({
            cors: {
                allowedHeaders: ['*'],
                origin: '*'
            }
        });
        
        sub.subscribe("MESSAGES")
    }

    public initListeners() {
        const io = this.io;
        console.log(`Init Socket Listeners...`)
        io.on('connect', (socket) => {
            console.log(`New Socket Connected`, socket.id);

            socket.on('event:message', async ({message}: {message: string}) => {
                console.log(`New Message Rec.`, message)
                await pub.publish('MESSAGES', JSON.stringify({message}))
            });
        })

        sub.on('message', (channel, message) =>{
            if (channel === 'MESSAGES') {
                io.emit('message', message)
            }
        })
    }

    get io() {
        return this._io;
    }
}

export default SocketService;