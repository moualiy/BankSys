import React from 'react';

const mock = {
  BrowserRouter: ({children}) => <div>{children}</div>,
  Link: ({children}) => <a>{children}</a>,
  Route: ({children}) => <div>{children}</div>,
  Routes: ({children}) => <div>{children}</div>,
  useNavigate: () => () => {},
  useParams: () => ({}),
};

module.exports = mock;