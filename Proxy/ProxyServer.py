import websockets
import asyncio


class ProxyServer:
    def __init__(self, websocket_port, address):
        # Creating websocket
        self.web_port = websocket_port
        self.address = address

    async def run(self):
        async for websocket in websockets.connect(self.address + ":" + str(self.web_port)):
            try:
                message_to_send = ''
                while message_to_send != 'stop':
                    message_to_send = input()
                    if message_to_send != 'stop':
                        print("Sending: ", message_to_send)
                        await websocket.send(message_to_send)
                        response = await websocket.recv()
                        print(response)
                break

            except websockets.ConnectionClosed:
                print("Connection closed")
                continue


server = ProxyServer(8222, "ws://localhost")
asyncio.run(server.run())
