import {
  ApiRegistry,
  alertApiRef,
  errorApiRef,
  AlertApiForwarder,
  ConfigApi,
  ErrorApiForwarder,
  ErrorAlerter,
  oauthRequestApiRef,
  OAuthRequestManager,
  storageApiRef,
  WebStorage,
  GithubAuth,
  githubAuthApiRef,
} from '@backstage/core';

import { catalogApiRef, CatalogClient } from '@backstage/plugin-catalog';

import { scaffolderApiRef, ScaffolderApi } from '@backstage/plugin-scaffolder';

import {
  GithubActionsClient,
  githubActionsApiRef,
} from '@backstage/plugin-github-actions';

export const apis = (config: ConfigApi) => {
  // eslint-disable-next-line no-console
  console.log(`Creating APIs for ${config.getString('app.title')}`);

  const backendUrl = config.getString('backend.baseUrl');

  const builder = ApiRegistry.builder();

  const alertApi = builder.add(alertApiRef, new AlertApiForwarder());
  const errorApi = builder.add(
    errorApiRef,
    new ErrorAlerter(alertApi, new ErrorApiForwarder()),
  );

  builder.add(storageApiRef, WebStorage.create({ errorApi }));
  const oauthRequestApi = builder.add(oauthRequestApiRef, new OAuthRequestManager());
  const githubAuthApi = builder.add(
    githubAuthApiRef,
    GithubAuth.create({
      backendUrl,
      basePath: '/auth/',
      oauthRequestApi,
    }),
  );
  builder.add(githubActionsApiRef, new GithubActionsClient());

  builder.add(
    catalogApiRef,
    new CatalogClient({
      apiOrigin: backendUrl,
      basePath: '/catalog',
    }),
  );

  builder.add(
    scaffolderApiRef,
    new ScaffolderApi({
      apiOrigin: backendUrl,
      basePath: '/scaffolder/v1',
    }),
  );

  return builder.build();
};
