const axios = require('axios');

class GeneralStore {
  constructor(baseUrl, models) {
    this.baseUrl = baseUrl;
    this.models = models;
    this.reducerBody = this.generateReducerBody(this.models);
  }

  generateReducer = (model) => {
    return (state = [], action) => {
      if (action.type === `GET_${model}`) return action.payload;
      if (action.type === `POST_${model}`) return [...state, action.payload];
      if (action.type === `PUT_${model}`)
        return state.map((x) =>
          x.id === action.payload.id ? action.payload : x
        );
      if (action.type === `DELETE_${model}`)
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

  genericGet = (route, model) => {
    return async (dispatch) => {
      const response = await axios({
        url: `${route}/${model}`,
        baseURL: this.baseUrl,
      });
      dispatch({ type: `GET_${model}`, payload: response.data });
    };
  };

  genericPost = (route, model, data) => {
    return async (dispatch) => {
      const response = await axios({
        method: 'post',
        url: `${route}/${model}`,
        baseURL: this.baseUrl,
        data,
      });
      dispatch({ type: `POST_${model}`, payload: response.data });
    };
  };

  genericPut = (route, model, data, identifier) => {
    if (!identifier) identifier = { id: data.id };
    return async (dispatch) => {
      const response = await axios({
        method: 'put',
        url: `${route}/${model}`,
        baseURL: this.baseUrl,
        data: { data, identifier },
      });
      dispatch({ type: `PUT_${model}`, payload: response.data });
    };
  };

  genericDelete = (route, model, identifier) => {
    return async (dispatch) => {
      const response = await axios({
        method: 'delete',
        url: `${route}/${model}`,
        baseURL: this.baseUrl,
        data: identifier,
      });
      dispatch({ type: `DELETE_${model}`, payload: response.data });
    };
  };
}

// module.exports = GeneralStore;
export default GeneralStore;
