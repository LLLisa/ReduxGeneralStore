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
        data,
      });
      dispatch({ type: `POST_${slice}`, payload: response.data });
    };
  };

  genericPut = (slice, identifier, data) => {
    return async (dispatch) => {
      const response = await axios({
        method: 'put',
        //url needs to be dynamic
        url: `/api/${slice}`,
        baseURL: this.baseUrl,
        //if no identifier, data.id
        data: { identifier, data },
      });
      dispatch({ type: `PUT_${slice}`, payload: response.data });
    };
  };

  // genericDelete = (slice, identifier) => {
  //   return async (dispatch) => {
  //     const response = await axios({
  //       method: 'delete',
  //       url: `/api/${slice}`,
  //       baseURL: this.baseUrl,
  //       data: { identifier, data },
  //     });
  //     dispatch({ type: `PUT_${slice}`, payload: response.data });
  //   };
  // };
}

module.exports = GeneralStore;
