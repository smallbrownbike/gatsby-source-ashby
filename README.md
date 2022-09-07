# gatsby-source-ashby

> Sources jobs, job postings, and custom fields from Ashby

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
        listedOnly: true,
      },
    },
  ],
};
```

## Querying

### Job postings

```
{
  allAshbyJobPosting {
    nodes {
      ...
    }
  }
}
```

### Job posting info

Job posting info is attached to each `AshbyJobPosting` node. If you want to build out forms based on the job's Application Form in Ashby, an example query to pull the form fields looks like this:

```
allAshbyJobPosting {
  nodes {
    info {
      applicationFormDefinition {
        sections {
          fields {
            field {
              path
              isNullable
              title
              type
            }
          }
        }
      }
    }
  }
}
```

### Custom fields

Ashby allows you to attach custom fields to each job. Custom fields are handy for displaying information that Ashby doesn't already have a field for.

Each `AshbyJobPosting` node has an `AshbyJob` parent node from which you can access the job's custom fields. Custom fields with selectable values automatically return the human-friendly label of the custom field. Neat!

```
allAshbyJobPosting {
  nodes {
    parent {
      ... on AshbyJob {
        customFields {
          title
          value
        }
      }
    }
  }
}
```
