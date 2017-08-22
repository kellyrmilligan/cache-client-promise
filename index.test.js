'use strict';

var _index = require('./index');

var _index2 = _interopRequireDefault(_index);

require('isomorphic-fetch');

var _fetchMock = require('fetch-mock');

var _fetchMock2 = _interopRequireDefault(_fetchMock);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var mockData = [{
  "id": "12345",
  "title": "test article title"
}, {
  "id": "67890",
  "title": "test article title 2"
}];

describe('client cache', function () {

  afterEach(function () {
    _fetchMock2.default.reset();
    _fetchMock2.default.restore();
  });

  it('can be instantiated', function () {
    expect(new _index2.default()).toBeTruthy();
  });

  it('give me the data back and cache it when not in the cache', function () {
    _fetchMock2.default.getOnce('/api/articles/12345', { body: mockData[0], headers: { 'content-type': 'application/json' } });

    var myCache = new _index2.default();

    return myCache.get('article-12345', function () {
      return fetch('/api/articles/12345', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'same-origin'
      }).then(function (response) {
        return response.json();
      });
    }).then(function (article) {
      expect(article.title).toBe('test article title');
      myCache.get('article-12345').then(function (article) {
        expect(article).toEqual(mockData[0]);
      });
    });
  });

  it('will resolve all the outstandng promises as they come in', function (done) {
    _fetchMock2.default.getOnce('/api/articles/12345', { body: mockData[0], headers: { 'content-type': 'application/json' } });

    var myCache = new _index2.default();

    Promise.all([myCache.get('article-12345', function () {
      return fetch('/api/articles/12345', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'same-origin'
      }).then(function (response) {
        return response.json();
      });
    }), myCache.get('article-12345', function () {
      return fetch('/api/articles/12345', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'same-origin'
      }).then(function (response) {
        return response.json();
      });
    })]).then(function (results) {
      expect(results.length).toBe(2);
      expect(_fetchMock2.default.calls('/api/articles/12345')[0].length).toBe(2);
      done();
    });
  });

  it('will give you the error if it happens when executing the request', function () {
    _fetchMock2.default.getOnce('/api/articles/67890', { status: 500, headers: { 'content-type': 'application/json' } });

    var myCache = new _index2.default();

    return myCache.get('article-67890', function () {
      return fetch('/api/articles/67890', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'same-origin'
      }).then(function (response) {
        if (response.ok) return response.json();
        throw new Error(response.statusText);
      });
    }).catch(function (reason) {
      expect(reason.message).toBe('Internal Server Error');
    });
  });

  it('will give you null if you do a normal get with no request function and it does not exist', function () {

    var myCache = new _index2.default();

    return myCache.get('asdfasdfasdf').then(function (data) {
      expect(data).toBeNull();
    });
  });
});
//# sourceMappingURL=index.test.js.map