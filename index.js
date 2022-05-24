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
      return state;
    };
  };

  generateReducerBody = (models) => {
    return models.reduce((body, model) => {
      body[model] = this.generateReducer(model);
      return body;
    }, {});
  };

  genericLoad = (slice) => {
    return async (dispatch) => {
      const response = await axios({
        url: `/api/${slice}`,
        baseURL: this.baseUrl,
      });
      dispatch({ type: `LOAD_${slice}`, payload: response.data });
    };
  };

  genericPost = (slice, data) => {
    return async (dispatch) => {
      const response = await axios({
        method: 'post',
        url: `/api/${slice}`,
        baseURL: this.baseUrl,
        data: data,
      });
      dispatch({ type: `POST_${slice}`, payload: response.data });
    };
  };
}

module.exports = GeneralStore;
