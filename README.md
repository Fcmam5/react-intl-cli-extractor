# react-intl-cli-extractor

Extracts messages from [react-intl components](https://github.com/yahoo/react-intl) for translation.
This simple CLI tool doesn't require any Babel config/setup, it's a lazy solution for lazy people, it extract the `defaultMessage` from `<FormattedMessage />` Component and then add an ID. The IDs will be exported to a separate file (`src/locales/source.json`).

## Example

```javascript
class Login extends Component {
    //..Magic..

    render() {
        return (
            <LoginWrapper>
                <FormattedMessage defaultMessage="Sign In Now" />
            </LoginWrapper>
            )
    }
}
```

Will became 

```javascript
class Login extends Component {
    //..Magic..

    render() {
        return (
            <LoginWrapper>
                {/* The ID is camelCase */}
                <FormattedMessage id="relative/path/to/componentFile/signInNow" defaultMessage="Sign In Now" />
            </LoginWrapper>
            )
    }
}
```

And the the exported `locales/source.json` will have:

```json
{
    "relative/path/to/componentFile/signInNow": "Sign In now"
}
```

