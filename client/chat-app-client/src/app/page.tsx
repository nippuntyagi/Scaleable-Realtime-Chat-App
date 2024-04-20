'use client';
import { useSocket } from '@/context/SockerProvider';
import classes from './page.module.css'
import { useState } from 'react';

export default function Page() {
  const {sendMessage, messages} = useSocket();
  const [message, setMessage] = useState('')

  return (
    <div>
      <div>
        <input className={classes["chat-input"]} type="text" placeholder="Message..." onChange={e => setMessage(e.target.value)}/>
        <button className={classes["button"]} onClick={e => sendMessage(message)}>Send</button>
      </div>
      <div>
        {messages.map(e => <li key={Math.random()}> { e } </li> )}
      </div>
    </div>
  )
}