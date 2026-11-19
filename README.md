# NEON SIEGE 13 · Afterlight

NEON SIEGE is a first-person sci-fi browser game with five themed worlds, grapple movement, robot waves, 3D scenery, fifteen energy weapons, and online friend matches.

## Campaign and training updates

- **Shielded Overseer.** Take the high ground and shoot both shield emitters. The boss then drops its shield, moves through the streets, and calls in reinforcements.
- **Bonus objectives.** Hold a beacon's perimeter during Beacon Defense or race to the marked roof during Rooftop Relay. Completing either awards credits.
- **Weapon mods.** Open **Mods** in the wave shop and choose an owned weapon. Install a Quick Loader, Extended Cell, or sidearm Burst Module. Each weapon can take one mod per mission.
- **Training Range.** Select any district and choose **Training Range**. All fifteen weapons are available with unlimited reserve ammo. Practice on respawning targets or use the district's rooftops to practice grappling. Pause to pick a weapon directly or reset the range.

## What's new in Afterlight

- Five reworked districts have distinct skies, building fronts, routes, rooftop anchors, and giant landmarks. Concrete slabs retain their joints and lane markings.
- The armory includes three purchasable sidearms, the Arc Pistol, Kestrel Burst, and Ember Hand Cannon. Weapons have distinct 3D bodies, animated reloads, recoil, and firing sounds.
- Concrete houses provide solid cover across all five districts.
- The campaign starts with two frag grenades. Buy extra grenades and molotovs under Supplies between waves. Molotovs leave a patch of fire that damages robots.
- Precision blasters use magnified scopes. Other blasters use a clear reflex sight with a centered red dot.
- Depth-tested trails, armor sparks, robot debris, and supply pulses provide feedback in combat.
- Rush Protocol accelerates striker arrivals, Sky Lock brings airborne units, and Armored Convoy pairs heavy units with repair escorts. Signal Cache offers a timed supply objective. The shop previews the next event.

| District | Landmark |
| --- | --- |
| Neon Relay | Illuminated rooftop signal loop |
| Canopy Works | Rainforest pumping station and overhead conduit |
| Ironwake Harbor | Freight terminal with a cargo gantry |
| Aurora Outpost | Radio telescope under a polar aurora |
| Sunstone Array | Solar foundry with rooftop mirrors |

## Play

Keep the files together and open `index.html` in Chrome or Edge. Select a district and choose **Enter the World**. Click in the game for mouse capture.

| Control | Action |
| --- | --- |
| WASD | Walk / strafe |
| Mouse | Look around |
| Right mouse (hold) | Aim through scope or red-dot sight |
| Left mouse | Fire |
| Mouse wheel / Tab | Cycle unlocked weapons |
| Number keys | Equip a blaster directly |
| X | Swap between your primary and sidearm |
| Q / E | Grapple |
| Shift | Sprint |
| Space | Jump |
| Ctrl | Slide |
| C | Dash |
| F | Interact / climb |
| R | Reload |
| G | EMP pulse |
| H | Throw a frag grenade (campaign) |
| T | Throw a molotov (campaign) |
| M | Toggle audio |
| Esc | Pause |

## Online co-op survival

Run `npm ci` to install server dependencies, then run `npm start` and open [the local game](http://localhost:8080). On Windows, `start-online.cmd` handles both steps. For a friend on another device, use a running Neon Siege server you can both reach.

Choose **Play Online**, select **Co-op survival**, and create a room. Share its invite link or code, then start the match when your friend joins. Clear eight waves together using the online armory. The next wave resupplies the team and revives a downed teammate. If both players go down, the run ends.

## GitHub Pages

Upload this folder's HTML, JavaScript, and `world-previews.webp` to the root of a GitHub repository. In **Settings → Pages**, choose **Deploy from a branch**, `main`, `/ (root)`. The PNG gameplay previews are optional. The campaign runs with local assets and needs no external libraries.

## Environment and sound credits

- The WebGL concrete surface uses an adapted CC0 texture from [ambientCG Concrete 034](https://ambientcg.com/view?id=Concrete034).
- Neon Relay and Aurora Outpost use a recolored Column Astra from the CC0 [Quaternius Modular Sci-Fi Megakit](https://quaternius.com/packs/modularscifimegakit.html), obtained from the [FreeModels GitHub archive](https://github.com/agentkaerf/FreeModels/tree/main/Modular%20SciFi%20MegaKit%5BStandard%5D/glTF/Columns).
- Weapon sounds combine original Web Audio synthesis and three CC0 [Kenney Sci-Fi Sounds](https://kenney.nl/assets/sci-fi-sounds) samples from the [Aetherium asset collection](https://github.com/danvanderboom/Aetherium/blob/main/samples/unity/Aphelion/ATTRIBUTIONS.md).
- References for original implementations include [Godot's 3D particle trail demo](https://github.com/godotengine/godot-demo-projects/tree/master/3d/particles) and [Valve's talk on encounter pacing](https://cdn.cloudflare.steamstatic.com/apps/valve/2009/ai_systems_of_l4d_mike_booth.pdf).

## Enemy model credits

The game adapts these models by Quaternius under [CC0 1.0](https://creativecommons.org/publicdomain/zero/1.0/). The local meshes use simplified geometry and recolored materials for the game's renderer.

| Roles | Original models |
| --- | --- |
| Scout and striker | [Robot Enemy](https://poly.pizza/m/1gNo5ezvmr) and [Robot Enemy Legs Gun](https://poly.pizza/m/lFZfDh2hzP) |
| Sentinel, bulwark, and elite | [Robot Enemy Large Gun](https://poly.pizza/m/mWojM4i2IH) and [Robot Enemy Large](https://poly.pizza/m/mPDR0L5uKx) |
| Aerial | [Robot Enemy Flying Gun](https://poly.pizza/m/UDTM6X1y9a) |
| Support and boss | [Animated Robot](https://poly.pizza/m/QCm7qe9uNJ) and [Mech](https://poly.pizza/m/4UvIHxnoSR) |

Source copies of the Large Gun, Animated Robot, and Mech came from [Aetherium's Quaternius asset collection on GitHub](https://github.com/danvanderboom/Aetherium/blob/main/samples/unity/Aphelion/ATTRIBUTIONS.md).

## Notes

- Each campaign mission starts at wave 1 with the VX-9 Blaster and a fresh supply of ammo. Weapons you buy carry through that mission and become available to buy again when you restart. Menu settings and best scores are stored locally in your browser.
- Direct online 1v1 is experimental and has not been verified across different devices or networks.
- The scope is game artwork, not a simulation of a real optical device.
