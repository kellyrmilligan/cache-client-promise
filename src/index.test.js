import ClientCache from './index'

import 'isomorphic-fetch'
import fetchMock from 'fetch-mock'

const mockData = [
  {
    "id":"12345",
    "title": "test article title"
  },
  {
    "id":"67890",
    "title": "test article title 2"
  },
]

describe('client cache', () => {

  afterEach(() => {
    fetchMock.reset()
    fetchMock.restore()
  })

  it('can be instantiated', () => {
    expect(new ClientCache()).toBeTruthy()
  })

  it('give me the data back and cache it when not in the cache', () => {
    fetchMock.getOnce('/api/articles/12345', { body: mockData[0], headers: { 'content-type': 'application/json' } })

    const myCache = new ClientCache();

    return myCache.get('article-12345', function () {
      return fetch(`/api/articles/12345`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'same-origin'
      })
        .then(response => response.json())
    })
      .then((article) => {
        expect(article.title).toBe('test article title')
        myCache.get('article-12345').then((article) => {
          expect(article).toEqual(mockData[0])
        })
      })
  })

  it('will resolve all the outstandng promises as they come in', (done) => {
    fetchMock.getOnce('/api/articles/12345', { body: mockData[0], headers: { 'content-type': 'application/json' } })

    const myCache = new ClientCache();

    Promise.all([
      myCache.get('article-12345', function () {
        return fetch(`/api/articles/12345`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json'
          },
          credentials: 'same-origin'
        })
          .then(response => response.json())
      }),
      myCache.get('article-12345', function () {
        return fetch(`/api/articles/12345`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json'
          },
          credentials: 'same-origin'
        })
          .then(response => response.json())
      })
    ])
      .then((results) => {
        expect(results.length).toBe(2)
        expect(fetchMock.calls('/api/articles/12345')[0].length).toBe(2)
        done()
      })
  })

  it('will give you the error if it happens when executing the request', () => {
    fetchMock.getOnce('/api/articles/67890', { status: 500, headers: { 'content-type': 'application/json' } })

    const myCache = new ClientCache();

    return myCache.get('article-67890', function () {
      return fetch(`/api/articles/67890`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'same-origin'
      })
        .then(response => {
          if (response.ok) return response.json()
          throw new Error(response.statusText)
        })
    })
      .catch((reason) => {
        expect(reason.message).toBe('Internal Server Error')
      })
  })


  it('will give you null if you do a normal get with no request function and it does not exist', () => {

    const myCache = new ClientCache();

    return myCache
      .get('asdfasdfasdf')
      .then((data) => {
        expect(data).toBeNull()
      })

  })

  it('let you clear the cache', () => {

    fetchMock.getOnce('/api/articles/12345', { body: mockData[0], headers: { 'content-type': 'application/json' } })

    const myCache = new ClientCache();

    return myCache.get('article-12345', function () {
      return fetch(`/api/articles/12345`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'same-origin'
      })
        .then(response => response.json())
    })
      .then((article) => {
        myCache.clear()
        expect(Object.keys(myCache.cache).length).toBe(0)
      })

  })

  it('let you clear the cache by key', () => {

    fetchMock.getOnce('/api/articles/12345', { body: mockData[0], headers: { 'content-type': 'application/json' } })

    const myCache = new ClientCache();

    return myCache.get('article-12345', function () {
      return fetch(`/api/articles/12345`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'same-origin'
      })
        .then(response => response.json())
    })
      .then((article) => {
        myCache.clear('article-12345')
        expect(Object.keys(myCache.cache).length).toBe(0)
      })

  })

})
