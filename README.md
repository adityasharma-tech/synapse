# Folder structure
- Extension
- Server
- Web

### Steps:
0. Create a server where admin can continuously throw files data and terminal data to the mongodb.

1. Create a vscode extension which will throw file [create delete update] information to the server and store it in mongodb through websockets and also read stats information from the server.

2. Create a web app where user can see all the admin files and update in realtime by polling every 2-3 seconds, also both admin and own output are available there.

3. Reader (user) can also modify the files but it will save to her directory not to the server.