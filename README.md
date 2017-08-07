## jira-timetracker

#### Why?
The JIRA timetracker tool is an internal agosto tool for tracking time against JIRA in a more efficient way.
The JIRA timetracker tool is intended to be used with an excel/google sheets spread sheet in the following format:

```
    DATE            STORY   TIME    DESCRIPTION
    Mon 07-10-2017  XX-0001	45m	get report for chris what devices have long keys
```

### Run FE:
1. `cd webapp`
2. `npm install`
3. `npm run start`

### Build FE:
1. `cd webapp`
2. `npm install`
3. `npm run build`

### Run Backend:
1. `pip install -r requirements.txt`
2. `python main.py`

### Deploy
`gcloud app deploy`

#### Gotcha's
`forked_jira` is a forked version of the `jira` package. Docs can be found here: `https://jira.readthedocs.io/en/master/`. The library was forked to remove some tweaks to limit retry attempts, as they provided a bad user experience (30+ second wait time in some cases)

### Configuration
Configure `webapp/src/config.js` with your JIRA instance name.