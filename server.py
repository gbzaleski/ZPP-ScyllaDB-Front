 
# Importing the relevant libraries
import websockets
import asyncio

PORT = 8222

print("Server listening on Port " + str(PORT))

async def echo(websocket, path):
    counter = 0
    print("A client just connected")
    try:
        async for message in websocket:

            counter += 1
            await websocket.send(f"{counter}. response: {message}")
    except websockets.exceptions.ConnectionClosed as e:
        print("A client just disconnected")

start_server = websockets.serve(echo, "localhost", PORT)

asyncio.get_event_loop().run_until_complete(start_server)
asyncio.get_event_loop().run_forever()

