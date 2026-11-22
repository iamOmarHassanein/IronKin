# IRONKIN Film 001: "The Six O'Clock"

Prompt package written with the `animated-short-film` skill (`.claude/skills/animated-short-film`).
Nothing here is generated yet. Run the plate prompts in your image tool, bring the images back, and the master video prompt gets written from the real plates (the skill does not write it before the plates exist).

The website (version 02, section "Film 001") plays an animated storyboard of these beats using existing campaign photos as stand-ins until the film is rendered.

## Settings

| Setting | Value |
| --- | --- |
| Duration | 30 seconds |
| Format | 16:9, 1920x1080 (cut a 9:16 version for Reels after) |
| Look | Painterly: rough flat colour planes, visible brush marks, ragged edges, graphic shadow shapes. Forge black, bone, oxblood; dawn blue and sodium orange in the city. |
| Audio | Native diegetic (feet, breath, tram bell, shutter); no music in the master |

## Story

**One sentence:** A lifter has to make the 06:00 crew session, misses the tram, sprints the footbridge stairs instead, and reaches the gym as the shutter rises and the crew is already waiting in the same kit.

| Seconds | Beat and camera | State and sound |
| --- | --- | --- |
| 0-4 | Medium: in a dark stairwell he pulls the hood of the black IRONKIN hoodie up and looks at the wall clock, 05:41. | One lifting belt hooked through the bag strap; zip, breath, distant traffic. |
| 4-9 | Low tracking behind him out of the door into blue dawn; he runs to the tram stop. | Same belt and bag; footsteps on wet pavement. |
| 9-13 | Wide: the tram pulls away as he arrives; he looks right to the footbridge. | Tram bell, doors hiss; motivated route change. |
| 13-20 | Side tracking up the footbridge stairs, two at a time; camera rises with him; city skyline opens behind. | Breath louder, bag bouncing on the same shoulder. |
| 20-25 | He comes down the far side; across the road the gym's steel shutter starts to rise, light spilling out. | Shutter rattle; his pace drops to a walk. |
| 25-30 | Wide: three crew members in IRONKIN kit wait in the doorway; one nods; he steps in; hold on the lit doorway and the anvil on the shutter. | Shutter stops; a single nod; diegetic room tone. |

## Reference pack (plate prompts)

Upload order for the master prompt later: 1 hero sheet, 2 crew sheet, 3 stairwell, 4 tram stop, 5 footbridge, 6 gym frontage.

### 1. Hero sheet

```text
One original lifter, about 25, broad shoulders, short dark curly hair, light stubble. Oversized black heavyweight hoodie with cream contrast flatlock seams and a kangaroo pocket, small cream anvil mark on the left chest, black wide-leg track pants with a single cream side stripe, worn white trainers. One black lifting belt hooked through the strap of one black shoulder bag on his right shoulder. Full-body front, side and back views of the SAME person on a plain pale-grey ground; constant face, proportions, colours and accessories. Chunky painterly concept art, rough edges, flat shadow planes, visible brushwork. No labels or watermark.
```

| Setting | Value |
| --- | --- |
| Model | Your image model (Nano Banana / GPT Image / Midjourney) |
| Type | image |
| Aspect | 16:9 |
| References | none (or the IRONKIN hoodie product photo as a garment reference) |

### 2. Crew sheet

```text
Three original athletes standing together, front view then back view: a woman in her mid-twenties with a dark ponytail wearing a dusty-rose cropped tee with burgundy binding and dusty-rose flared track pants with burgundy piping; a lean man in a black fitted compression tee with cream seams and black wide-leg track pants with a cream stripe; a tall man in the same black hoodie with cream seams. Distinct faces and silhouettes, constant clothing. Plain pale-grey ground. Chunky painterly concept art, rough edges, flat shadow planes, visible brushwork. No labels or watermark.
```

| Setting | Value |
| --- | --- |
| Model | Your image model |
| Type | image |
| Aspect | 16:9 |
| References | none |

### 3. Stairwell (opening)

```text
A single wide 16:9 plate of a narrow concrete apartment stairwell before dawn: worn steps in the foreground, a metal door with a small window in the midground, a round wall clock reading 05:41 on the background wall, one cold fluorescent tube and a strip of blue dawn through the door window. Bold irregular painted shapes, graphic shadows, loose atmospheric distance. Forge black, bone and cold blue. No people.
```

### 4. Tram stop

```text
A single wide 16:9 plate of a city tram stop at blue dawn: wet pavement and kerb in the foreground, a tram shelter and rails in the midground, a long empty street with a footbridge crossing it in the background, sodium-orange streetlights still on. Bold irregular painted shapes, graphic shadows, broad painted reflections on the wet road. No people, no readable signs.
```

### 5. Footbridge

```text
A single wide 16:9 plate of a steel-and-concrete pedestrian footbridge over a city road at dawn: steep stairs rising from the left foreground, the bridge deck across the midground, a skyline and a pale sunrise band behind. Bold irregular painted shapes, graphic shadows, big cumulus brush clouds. No people.
```

### 6. Gym frontage (destination)

```text
A single wide 16:9 plate of a small industrial gym frontage across a quiet street at first light: a steel roller shutter half raised with warm light spilling onto the wet pavement, a simple anvil shape painted in bone on the shutter, racks and plates visible inside as loose painted shapes. Forge black, bone, warm interior light, one oxblood accent. No people, no readable text.
```

| Setting (plates 3-6) | Value |
| --- | --- |
| Model | Your image model |
| Type | image |
| Aspect | 16:9 |
| References | plate 3 as a style reference for 4-6, so the world stays one coherent painting |

## Next step

Generate the six plates, check that the hero's hoodie, belt and bag match across views, and bring them back. Then run `/animate` in this project with the plates attached: it inspects them and writes the timestamped master video prompt (style locks, reference roles, beats) for your video model.
