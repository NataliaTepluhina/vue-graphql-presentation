module.exports = {
  pluginOptions: {
    apollo: {
      enableMocks: true,
      enableEngine: false
    }
  },
  chainWebpack: config => {
    config.module
      .rule("graphql")
      .test(/\.(graphql|gql)$/)
      .use("graphql-tag/loader")
      .loader("graphql-tag/loader")
      .end();
  }
};
