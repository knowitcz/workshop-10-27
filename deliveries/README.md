# Deliveries

Changes from the development team, one patch per delivery. Each touches only
production code (`src/`) or data tooling — never your tests.

| Patch | What arrives |
|---|---|
| `01-confirmation-screen.patch` | the confirmation screen between the calculator and the renewal |
| `02-quote-as-prop.patch` | the quote passed to the confirmation screen as a prop |
| `03-run-history.patch` | a script that seeds `mcp/history/` from your own e2e run |

## Taking a delivery

**On your own work:** commit what you have, download the patch (open it on the
repository page and use **Raw** → save), then:

```
git am -3 ~/Downloads/01-confirmation-screen.patch
```

`-3` lets git merge the delivery around a `data-cy` you added to the same
component. `git apply -3 <patch>` does the same without making a commit.

**Following the reference solution:** `git pull` — the patch arrives with the
code it describes.
