import { API_BASE_URL } from "./config/url"

declare const io: any

let socket: any;
let isCreating = false;

function createSocket() {
   
   
   
   
  const token = localStorage.getItem("token")

  const opts: any = {
    withCredentials: true,
  }

  if (token) {
    opts.auth = { token }
  }

   
  const newSocket = io('/', {
    ...opts,
    transports: ['websocket'],
    path: '/socket.io',
    query: { type: 'chat' },
  })
  
  newSocket.on("connect", () => {
     
  })

  newSocket.on("Welcome", (msg: string) => {
     
  })

  newSocket.on("disconnect", () => {
     
  })

  return newSocket
}

export function getSocket() {
  if (socket) return socket
  if (isCreating) return socket
  isCreating = true
  socket = createSocket()
  isCreating = false
  if (!socket) {
    console.error("Socket creation failed")
    return null
  }
  if (socket.connected) {
     
  } else {
     
  }
  return socket;
}

export function initializeSocket() {
  if (socket) {
     
    return socket
  }
  return getSocket()
}

export function disconnectSocket() {
  if (socket) {
    socket.disconnect()
    socket = null
  }
}

export { socket }
