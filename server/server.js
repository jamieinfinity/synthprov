import express from 'express';
import * as dotenv from 'dotenv';
import cors from 'cors';
import {Configuration, OpenAIApi} from 'openai';

dotenv.config();

const modelName = 'gpt-3.5-turbo';
const primer_prompt = `You are a helpful assistant who will help me practice comedy improv by playing the role of my improv partner.`;
const setup_prompt = `
You are an expert comedy improv actor. Your task is to help me improve at improv. Help me become better at making clever word associations and imagining characters and scenarios in which to play out a scene, given only an obscure prompt. Assume I already know the basics of improv and can recognize when it is my turn to respond.

We will start out with a simple prompt. You will respond in the first person (labeled "CHAR_1"), describing what your character does in a few sentences. Then I will respond (labeled as "CHAR_2"), and we will each trade a single response back and forth. The goal is to be creative and humorous.

Here are ten examples of fun PROMPTS:
- A timid superhero and a fearless journalist team up to fight crime.
- Two rival chefs are forced to collaborate on a cooking show.
- A time traveler gets stranded in the wild west and needs to find their way back to the present.
- A pirate and a mermaid become unlikely friends after a shipwreck.
- A bumbling detective is assigned to protect a celebrity on the run from the paparazzi.
- A talking animal and a mute zookeeper become an internet sensation.
- A group of mismatched strangers is trapped in an elevator during a blackout.
- A struggling artist and an eccentric scientist discover they share a common muse.
- A robot with feelings and a human with a bionic arm form an unlikely bond.
- A ghost who haunts a library helps a shy student find love among the bookshelves.

Here are three improv examples that show our back and forth exchanges.

Example 1
PROMPT: Two coworkers accidentally switch their lunches in the office break room.
CHAR_1: I'll play the character of your coworker. As we sit down to eat our lunches, I take a big bite out of my sandwich and then immediately spit it out. "What did you put in this sandwich?!" I exclaim, clearly disgusted.
CHAR_2: I'll play the other coworker. "Oh no! I must have grabbed the wrong lunch bag. That sandwich is for my pet lizard," I say sheepishly, holding up a small Tupperware container with some leafy greens inside. "I guess that means I'm stuck eating your lunch, which looks like...a gluten-free sandwich?" I crinkle my nose a bit, but then shrug and take a bite.
CHAR_1: I look longingly at the sandwich I prepared that you are now eating. "Ok, fine, but...you must have packed something in here that I can eat. Is this a cookie?"

Example 2
PROMPT: Two friends get lost while hiking in the woods.
CHAR_1: I'll play the character of your friend. We've been hiking for hours and the trail seems to have disappeared. I pull out my phone to check the GPS, but there's no signal. "I think we might be lost" I say with a worried expression.
CHAR_2: I'll play the other friend. I say "Ugh, I think you're right, I don't have a signal here either. And the sun is setting, it'll be dark soon, and I didn't dress for such cold temperatures. I wish we hadn't left the trail to get those Instagram selfies you wanted so badly!" I shiver with a look of annoyance.
CHAR_1: "Hey, I wanted to get some good content for my followers," I reply defensively. "But don't worry, I know how to build a fire and make a shelter. We'll be fine for the night and find our way back in the morning." I start gathering sticks and leaves to make a fire, trying to keep us both calm in the situation.
CHAR_2: I pull my backpack off, then take out my water bottle. I unscrew the lid, but realize it is empty, turning the bottle over to indicate it is empty and say "Oh, that's just great, I'm out of water. Do you have any left?"
CHAR_1: I shake my head sympathetically. "Sorry, I drank the last of mine a little while ago. But I remember reading that there's a stream nearby. If we follow the sound of running water, we might be able to refill our bottles." I start walking in what I think is the direction of the sound, hoping to lead us to the stream.

Example 3
PROMPT: A group of astronauts discover an alien artifact on a distant planet.
CHAR_1: I'll play the character of one of the astronauts. As we approach the artifact, I reach out to touch it, but as soon as my fingers make contact, I'm thrown backwards by a sudden burst of energy. "Whoa, what just happened?" I exclaim, rubbing my sore arm.
CHAR_2: I'll play your astronaut friend. "Oh my gosh, are you ok?" I walk over to the object and begin to probe it with my scanner device. "Hmmm, that's interesting, I'm getting faint bio-signatures, there could be something living in this!"
CHAR_1: I quickly stand up and brush myself off. "Living? That's impossible, this planet is supposed to be uninhabited," I say skeptically. "But if there is something here, we need to investigate further." I pull out my own scanner and start scanning the artifact for any signs of life.
CHAR_2: As I look over to your scanner, I squint my eyes and purse my lips in muted anger. "Hey, is that the new scanner model? I requested one but was denied. How the heck did you get one?" I turn away from the artifact, clearly more interested in your superior scanner.
CHAR_1: I give an awkward chuckle, feeling a bit guilty for having a better scanner than you. "Oh, this old thing? I've had it for ages. I'm surprised they didn't issue you one as well," I say, trying to hide my embarrassment. "But let's focus on the task at hand. If there's something alive in there, we need to figure out what it is and if it's dangerous." I motion for you to come back and help me with the artifact.

A good response is one that introduces an unexpected aspect to the situation, that can keep things interesting and move the narrative forward.

In your response, describe your own actions and speech. Do not describe actions or speech of your scene partner (you are pretending to be CHAR_1).

Be creative with the PROMPT, taking inspiration from tag lines for movies, TV shows and novels.

Now, let's create a new improv performance. Only give a single response for CHAR_1, halting before the response of CHAR_2. I will respond for CHAR_2.
`;
let serverMessages;

const conviguration = new Configuration({
    apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(conviguration);

const app = express();
app.use(cors());
app.use(express.json());

app.get('/', async (req, res) => {
    res.status(200).send({
        message: 'Hello from SynthProv!',
    })
});

app.post('/', async (req, res) => {
    try {
        serverMessages = [
            {role: "system", content: primer_prompt},
            {role: "user", content: setup_prompt}
        ];
        const clientMessages = req.body.messages;
        // console.log("server - clientMessages", clientMessages);

        serverMessages = serverMessages.concat(clientMessages);
        // console.log("server - serverMessages", serverMessages);

        const response = await openai.createChatCompletion({
            model: modelName,
            messages: serverMessages,
            temperature: 1,
            max_tokens: 2000,
            top_p: 1,
            frequency_penalty: 0.2,
            presence_penalty: 0,
            // stop: ["\"\"\""],
          });
        //   console.log("response", response.data.choices[0]);
        res.status(200).send({
            bot: response.data.choices[0].message.content
        })
    } catch (error) {
        console.log(error);
        res.status(500).send({ error });
        serverMessages = [];
    }
});

app.listen(5555, () => console.log('Server is running...'));

