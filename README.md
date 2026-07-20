# RevDex

RevDex is a car-spotting app. See an interesting car out in the wild, snap a photo, and RevDex identifies the make, model, and year for you using AI. It then adds it to your personal digital garage that keeps things neat and tidy.

## The idea

Car spotting is a hobby a lot of people already do casually. Things like noticing a rare supercar, an interesting classic, or even just a JDM tuner car that you like. However currently there's no easy way to keep track of what you've seen. RevDex turns that into a collection game:

- **Spot** — point your camera at a car and take a photo.
- **Identify** — the photo is analyzed to detect the make, model, and year. You can add an optional hint (e.g. "badge says Alpine") to help it along, and if multiple cars are in frame, you pick the one you meant.
- **Store** — confirmed cars are saved to your garage, which builds up a personal collection over time.

The identification is built to be honest about uncertainty rather than always giving a confident-sounding answer. A wrong guess is worse than an "I'm not sure," especially for a collection you're meant to trust. Because of this AI information given is easily manually overwriteable if anything is seen as wrong.

## Core features

- Email/password accounts, so your garage is tied to you and persists across devices
- In-app camera capture flow
- AI-assisted car identification from a photo with manual override option available
- A collection screen to browse everything you've spotted
