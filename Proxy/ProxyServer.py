import websockets
import asyncio
import socket

class ProxyServer:
    def __init__(self, websocket_port, websocket_address, socket_port, socket_address):
        self.web_port = websocket_port
        self.web_address = websocket_address
        self.socket_info = (socket_address, socket_port)
        self.socket = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
          
    def run(self):
        async def echo(websocket, path):
            try:
                self.socket.connect(self.socket_info)
                async for message in websocket:
                    try: 
                        self.socket.sendall('SELECT * FROM table_name;'.encode())
                        data = self.socket.recv(1)
                        result = b''
                        while(len(data) > 0):
                            result = result + data
                            data = self.socket.recv(1)
                        await websocket.send(str(result))
                    finally:
                        self.socket.close()
            except websockets.exceptions.ConnectionClosed as e:
                print("A client just disconnected")

        start_server = websockets.serve(echo, self.web_address, self.web_port)

        asyncio.get_event_loop().run_until_complete(start_server)
        asyncio.get_event_loop().run_forever()
          
server = ProxyServer(8222, "localhost", 9042, "localhost")
server.run()