# gatsby-source-ashby

> Sources all published job postings from Ashby

## Installation

```bash
yarn add gatsby-source-ashby
```

## Usage

```javascript
// In your gatsby-config.js
module.exports = {
  plugins: [
    {
      resolve: `gatsby-source-ashby`,
      options: {
        apiKey: process.env.ASHBY_API_KEY,
      },
    },
  ],
};
```

## Querying

```
{
  allAshbyJob {
    nodes {
      ...
    }
  }
}
```
