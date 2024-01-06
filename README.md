# osu!UWaterloo website

This is a potential new frontend for the osu!UWaterloo club website.

## Acknowledgements

The osu! cookie on the root page uses code borrowed from the [first-edition of the osu!UWaterloo website](https://github.com/JerryZhu99/osu-uwaterloo-site). Many thanks to [Player0](https://osu.ppy.sh/users/3662205) ([GitHub](https://github.com/JerryZhu99)) and [ThunderBird2678](https://osu.ppy.sh/users/3388082) ([GitHub](https://github.com/thunderbird2678)) for creating the first edition!

This website is generated using [Hugo](https://gohugo.io/). The theme was developed by [Feiri](https://osu.ppy.sh/users/3214844) ([GitHub](https://github.com/yfxu)).

This website displays content in the [Quicksand](https://fonts.google.com/specimen/Quicksand/about) font, which is licensed under the [Open Font License](https://scripts.sil.org/cms/scripts/page.php?site_id=nrsi&id=OFL).

## Developing locally

Developing the website locally can help you preview changes before creating a merge request to the master branch. Make sure you have cloned the repository first:

```console
$ git clone https://github.com/osu-uwaterloo/osu-uwaterloo-website.git
$ cd osu-uwaterloo-website
```

### Option 1: Local Hugo Installation

Install *Hugo Extended*. Follow the [Hugo installation guide](https://gohugo.io/installation/) to install *Hugo Extended* on your platform of choice. After installation, run the following command in the project directory.

```console
$ hugo server
```
### Option 2: Docker Image

To avoid installing Hugo, you can also use the [Hugo docker image](https://hub.docker.com/r/jakejarvis/hugo-extended). First pull the image from Docker Hub, then run the following command.

```console
$ docker run -v $(pwd):/src -p 1313:1313 jakejarvis/hugo-extended:latest server --buildDrafts --buildFuture --bind 0.0.0.0
```

## Content management

The website content can be automatically updated by making changes to the relevant places in this Git repository. On commits/merges to the `master` branch, GitHub will run a build-and-deploy [action](https://docs.github.com/actions) to update the website on production. All merge requests must be approved by an authorized reviewer before being eligible for merging.

### about

The "about" page is a simple static-content page that describes the osu!UWaterloo club. The content for the "about" page can be modified by editing `/content/about/_index.md`.

### members

The "members" page showcases all current and past members of the osu!UWaterloo club. To configure the users that show up on this page, modify the `/data/members.yaml` file.

Members are split into three categories, each represented by a different array in the `members.yaml` file. Entries must follow their respective formats:

#### `executives`

```yaml
- username: string        # osu! username
  userId:   number        # osu! user ID
  term:     string        # UWaterloo term (eg. 1B or 4A etc)
  program:  string        # UWaterloo program (eg. ECE or AFM etc) 
  name:     string | null # IRL name
  discord:  string        # discord username
  twitch:   string | null # Twitch handle
  youtube:  string | null # YouTube handle 
  blurb:    string        # user blurb
  role:     string        # executive member role
```

#### `members`

```yaml
- username: string        # osu! username
  userId:   number        # osu! user ID
  term:     string        # UWaterloo term (eg. 1B or 4A etc)
  program:  string        # UWaterloo program (eg. ECE or AFM etc) 
  name:     string | null # IRL name
  discord:  string        # discord username
  website:  string | null # personal website
  twitch:   string | null # Twitch handle
  youtube:  string | null # YouTube handle
  github:   string | null # GitHub handle
  blurb:    string        # user blurb
```

#### `alumni`

```yaml
- username: string        # osu! username
  userId:   number        # osu! user ID
  program:  string        # UWaterloo program (eg. ECE or AFM etc) 
  name:     string | null # IRL name
  discord:  string        # discord username
  twitch:   string | null # Twitch handle
  youtube:  string | null # YouTube handle 
  blurb:    string        # user blurb
```

### events

The "events" page displays all current and past events hosted by osu!UWaterloo. To create a new event, create a new file under the `/content/events` directory. The file name should adhere to the following syntax:

- `<date>-<event-name>.md`

... where `<date>` is an [ISO 8601](https://en.wikipedia.org/wiki/ISO_8601)-formatted date (`year-month-day`) and `<event-name>` is some short identifier for the event. The file name will be used in the URL that points to the event post, so keep it short and sweet, but still distinguishable.

The recommended way to begin creating a new event is by using the following hugo command:

```console
$ hugo new "events/<date>-<event-name>.md"
```

Running this command will create a pre-formatted boilerplate document with instructions given on how to configure the [front-matter](https://gohugo.io/content-management/front-matter/).

It is advised to use images that are hosted locally within this repository to minimize reliance on external links. All cover images and any other images used for event posts should be saved under the `/static/event-images` directory.
