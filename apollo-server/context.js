import { db } from './utils/db';

// eslint-disable-next-line no-unused-vars
export default ({ req, connection }) => {
  return {
    db,
  };
};
