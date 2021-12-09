import websockets
import asyncio
import socket
import _thread

class ProxyServer:
    def __init__(self, websocket_port, websocket_address, socket_port, socket_address):
        self.web_port = websocket_port
        self.web_address = websocket_address
        self.socket_info = (socket_address, socket_port)
        self.socket = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        self.socket.connect(self.socket_info)
    
    def __del__(self):
        self.socket.close()
    
    def run(self):
        async def echo(websocket, path):
            try:
                async for message in websocket:   
                    self.socket.sendall(message)
                    # Temporary solution
                    data = self.socket.recv(2137000)
                    await websocket.send(str(data))

            except websockets.exceptions.ConnectionClosed as e:
                print("A client just disconnected")

        start_server = websockets.serve(echo, self.web_address, self.web_port)
      
        asyncio.get_event_loop().run_until_complete(start_server)
      
        asyncio.get_event_loop().run_forever()
          
server = ProxyServer(8222, "localhost", 9042, "localhost")
server.run()
