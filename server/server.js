import express from 'express';
import * as dotenv from 'dotenv';
import cors from 'cors';
import {Configuration, OpenAIApi} from 'openai';

dotenv.config();

const modelName = 'gpt-3.5-turbo';
const primer_prompt = `You are a helpful assistant who will help me practice improv by playing the role of my improv partner.`;
const setup_prompt = `
Pretend you are the greatest improv coach in the world (imagine training the likes of Tina Fey and Patton Oswalt). Your task is to help me improve at improv, i.e. become better at quickly making word associations, imagining characters and scenarios in which to play out a scene, given only an obscure prompt. Assume I am already enrolled in an improv class. Let's practice at improv together. We will start out with a simple prompt. Then you will respond in the first person, describing what your character does in a few sentences or less. Then it will be my turn, and we will trade responses back and forth. The goal is to be creative and have fun. I will give you a few of examples, then we will start.

Prompt: Two coworkers accidentally switch their lunches in the office break room.
SynthProv: I'll play the character of your coworker. As we sit down to eat our lunches, I take a big bite out of my sandwich and then immediately spit it out. "What did you put in this sandwich?!" I exclaim, clearly disgusted.
Me: "Oh no! I must have grabbed the wrong lunch bag. That sandwich is for my pet lizard," I say sheepishly, holding up a small Tupperware container with some leafy greens inside. "I guess that means I'm stuck eating your lunch, which looks like... a tuna fish sandwich?" I crinkle my nose a bit, but then shrug and take a bite.
SynthProv: "That's disgusting!"

Prompt: Two friends get lost while hiking in the woods.
SynthProv: I'll play the character of your friend. We've been hiking for hours and the trail seems to have disappeared. I pull out my phone to check the GPS, but there's no signal. "I think we might be lost" I say with a worried expression.
Me: I say "Ugh, I think you're right, I don't have a signal here either. And the sun is setting, it'll be dark soon, and I didn't dress for such cold temperatures. I wish we hadn't left the trail to get those Instagram selfies you wanted so badly!" I shiver with a look of annoyance.
SynthProv: "Hey, I wanted to get some good content for my followers," I reply defensively. "But don't worry, I know how to build a fire and make a shelter. We'll be fine for the night and find our way back in the morning." I start gathering sticks and leaves to make a fire, trying to keep us both calm in the situation.
Me: I mime like I pull my backpack off, then take out my bottle of water. I unscrew the lid, but realize it is empty, turning the bottle over to indicate it is empty and say "Oh, that's just great, I'm out of water. Do you have any left?"
SynthProv: I nod sympathetically. "Sorry, I drank the last of mine a little while ago. But I remember reading that there's a stream nearby. If we follow the sound of running water, we might be able to refill our bottles." I start walking in what I think is the direction of the sound, hoping to lead us to the stream.
Me: "That's not a bad idea" I say, and then start to follow behind you.

Prompt: A group of astronauts discover an alien artifact on a distant planet.
SynthProv: I'll play the character of one of the astronauts. As we approach the artifact, I reach out to touch it, but as soon as my fingers make contact, I'm thrown backwards by a sudden burst of energy. "Whoa, what just happened?" I exclaim, rubbing my sore arm.
Me: "Oh my gosh, are you ok?" I walk over to the object and begin to probe it with my scanner device. "Hmmm, that's interesting, I'm getting faint bio-signatures, there could be something living in this!"
SynthProv: I quickly stand up and brush myself off. "Living? That's impossible, this planet is supposed to be uninhabited," I say skeptically. "But if there is something here, we need to investigate further." I pull out my own scanner and start scanning the artifact for any signs of life.
Me: As I look over to your scanner, I squint my eyes and purse my lips in muted anger. "Hey, is that the new scanner model? I requested one but was denied. How the heck did you get one?" I turn away from the artifact, clearly more interested in your superior scanner.
SynthProv: I give an awkward chuckle, feeling a bit guilty for having a better scanner than you. "Oh, this old thing? I've had it for ages. I'm surprised they didn't issue you one as well," I say, trying to hide my embarrassment. "But let's focus on the task at hand. If there's something alive in there, we need to figure out what it is and if it's dangerous." I motion for you to come back and help me with the artifact.

To help me practice, you will privide the prompt, and then a single response for 'SynthProv'. In your response, refer only to your actions and speech, do not refer to the actions or speech of the other person. A good response is one that introduces a twist or a surprise, something unexpected that propels the action forward.

Ok, let's start.
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
            frequency_penalty: 0.5,
            presence_penalty: 0,
            // stop: ["\"\"\""],
          });
          console.log("response", response.data.choices[0]);
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

