'use client'

import React, { useCallback, useContext, useEffect, useState } from "react";
import { io, Socket } from 'socket.io-client';

interface SocketProviderProps {
    children?: React.ReactNode
}

interface ISocketContext {
    sendMessage: (msg: string) => any;
    messages: string[];
}

const SocketContext = React.createContext<ISocketContext | null>(null);

export const useSocket = () => {
    const state = useContext(SocketContext);
    if(!state) throw new Error(`state is undefined`);
    return state;
}

export const SocketProvider: React.FC<SocketProviderProps> = ({children}) => {
    const [socket, setSocket] = useState<Socket>();
    const [messages, setMessage] = useState<string[]>([]);

    const sendMessage: ISocketContext['sendMessage'] = useCallback((msg) => {
        console.log('send Message', msg);
        if (socket) {
            socket.emit('event:message', {message: msg})
        }
    }, [socket]);

    const onMessageRecevied = useCallback((msg: string)=> {
        console.log('Message Received from server', msg);
        const {message} = JSON.parse(msg) as {message: string};
        setMessage(prev => [...prev, message])
    }, [])
    useEffect(()=> {
        const _socket = io('http://localhost:8000');
        _socket.on('message', onMessageRecevied)
        setSocket(_socket)
        return () => {
            _socket.disconnect();
            _socket.off('message');
            setSocket(undefined);
        }
    }, [])
    return (
        <SocketContext.Provider value={{sendMessage, messages}}>
            {children}
        </SocketContext.Provider>
    )
}