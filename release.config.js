/**
 * 单仓联版发布：三包版本始终一致。
 *
 * 默认（自动）：由 Conventional Commits 决定 bump
 * - feat → minor
 * - fix / perf → patch
 * - BREAKING CHANGE / ! → major
 * - docs / chore / test / ci 等默认不发版
 *
 * 手动：CI 设置 FORCE_RELEASE=major|minor|patch，强制该级别发版（流程与自动相同）
 */
import { analyzeCommits as analyzeCommitsDefault } from '@semantic-release/commit-analyzer';

const ANALYZER_OPTS = {
  preset: 'conventionalcommits',
  releaseRules: [
    { type: 'feat', release: 'minor' },
    { type: 'fix', release: 'patch' },
    { type: 'perf', release: 'patch' },
    { type: 'revert', release: 'patch' },
    { type: 'docs', release: false },
    { type: 'style', release: false },
    { type: 'chore', release: false },
    { type: 'refactor', release: false },
    { type: 'test', release: false },
    { type: 'build', release: false },
    { type: 'ci', release: false },
  ],
};

const forced = process.env.FORCE_RELEASE;
const forcedRelease =
  forced === 'major' || forced === 'minor' || forced === 'patch'
    ? forced
    : null;

export default {
  branches: ['main'],
  tagFormat: 'v${version}',
  plugins: [
    {
      analyzeCommits: async (_pluginConfig, context) => {
        if (forcedRelease) {
          context.logger.log(
            `Manual release: forcing bump type "${forcedRelease}"`,
          );
          return forcedRelease;
        }
        return analyzeCommitsDefault(ANALYZER_OPTS, context);
      },
    },
    [
      '@semantic-release/release-notes-generator',
      {
        preset: 'conventionalcommits',
      },
    ],
    [
      '@semantic-release/changelog',
      {
        changelogFile: 'CHANGELOG.md',
      },
    ],
    [
      '@semantic-release/npm',
      {
        // 根 package 为 private，不发 npm
        npmPublish: false,
      },
    ],
    [
      '@semantic-release/exec',
      {
        prepareCmd:
          'node scripts/set-release-version.mjs ${nextRelease.version} && pnpm llm:generate && pnpm build',
        publishCmd:
          'pnpm --filter "@koi-ui/*" publish --access public --no-git-checks',
      },
    ],
    [
      '@semantic-release/git',
      {
        assets: [
          'CHANGELOG.md',
          'packages/core/package.json',
          'packages/hooks/package.json',
          'packages/tokens/package.json',
        ],
        message:
          'chore(release): ${nextRelease.version}\n\n${nextRelease.notes}',
      },
    ],
    '@semantic-release/github',
  ],
};
