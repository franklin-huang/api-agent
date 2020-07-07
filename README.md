# api-agent

A library to simplify api request

## Installing

Using yarn:

```sh
yarn add api-agent
```

## Example

```javascript
import request from 'api-agent'

// required
const baseURL = 'http://localhost:3000'
// required
const pathMap = {
  user: '/user'
  userById: '/user/:id'
}

const API = new request({
  baseURL,
  pathMap,
  withCredentials: true // optional
})

// Add custom headers
API.setHeaders({
  Authorization: 'access-token',
  xSelector: '....',
})

// Post with request body
const newUser = (username, email, password) => API.post('user', {
  body: { username, email, password }
})
// It will hit http://localhost:3000/user with username, email and password in the request body
newUser('alphaxkiller', 'frankie0628@gmail.com', 'abc')

// Get with params
const getUserById = id => API.get('userById', {
  params: { id }
})
// it will hit http://localhost:3000/user/10
getUserById(10)


// Get with queries
const searchUser = ({limit, page}) => API.get('user', {
  queries: { limit, page }
})
// it will hit http://localhost:3000/user?limit=10&page=1
searchUser({limit: 10, page: 1})
```
