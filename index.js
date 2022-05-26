const axios = require('axios');

class GeneralStore {
  constructor(baseUrl, models) {
    this.baseUrl = baseUrl;
    this.models = models;
    this.reducerBody = this.generateReducerBody(this.models);
  }

  generateReducer = (slice) => {
    return (state = [], action) => {
      if (action.type === `LOAD_${slice}`) return action.payload;
      if (action.type === `POST_${slice}`) return [...state, action.payload];
      if (action.type === `PUT_${slice}`)
        return state.map((x) =>
          x.id === action.payload.id ? action.payload : x
        );
      if (action.type === `DELETE_${slice}`)
        return state.filter((x) => x.id !== action.payload.id);
      return state;
    };
  };

  generateReducerBody = (models) => {
    return models.reduce((body, model) => {
      body[model] = this.generateReducer(model);
      return body;
    }, {});
  };

  genericLoad = (url, slice) => {
    return async (dispatch) => {
      const response = await axios({
        url: `${url}/${slice}`,
        baseURL: this.baseUrl,
      });
      dispatch({ type: `LOAD_${slice}`, payload: response.data });
    };
  };

  genericPost = (url, slice, data) => {
    return async (dispatch) => {
      const response = await axios({
        method: 'post',
        url: `${url}/${slice}`,
        baseURL: this.baseUrl,
        data,
      });
      dispatch({ type: `POST_${slice}`, payload: response.data });
    };
  };

  genericPut = (url, slice, data, identifier) => {
    if (!identifier) identifier = { id: data.id };
    console.log(data, identifier);
    return async (dispatch) => {
      const response = await axios({
        method: 'put',
        url: `${url}/${slice}`,
        baseURL: this.baseUrl,
        data: { data, identifier },
      });
      dispatch({ type: `PUT_${slice}`, payload: response.data });
    };
  };

  genericDelete = (url, slice, identifier) => {
    return async (dispatch) => {
      const response = await axios({
        method: 'delete',
        url: `${url}/${slice}`,
        baseURL: this.baseUrl,
        identifier,
      });
      dispatch({ type: `POST_${slice}`, payload: response.data });
    };
  };
}

module.exports = GeneralStore;

//should 'url' be 'route'?
//slice => model
