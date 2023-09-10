import "react-native-url-polyfill/auto"
import {Button, StyleSheet, Text, TextInput, View} from 'react-native';
import {useState} from "react";
import {OpenAIApi, Configuration} from "openai";
import {AnimatedCircularProgress} from "react-native-circular-progress";

const config = new Configuration({
    apiKey: process.env.API_KEY,
})

const openai = new OpenAIApi(config);


export default function App() {
    const [productName, setProductName] = useState('');
    const [productDescription, setProductDescription] = useState('');

    const [isFetching, setIsFetching] = useState(false);
    const [result, setResult] = useState();
    const {ecoFriendliness} = result || {};
    const tintColor = ecoFriendliness > 70 ? "#00ff00" : ecoFriendliness > 30 ? "#ffff00" : "#ff0000";
    return (
        <View style={styles.container}>
            <TextInput value={productName} onChangeText={setProductName} placeholder={'Product Name'}/>
            <TextInput multiline={true} value={productDescription} onChangeText={setProductDescription}
                       placeholder={'Product Description'}/>
            <Button title={'Submit'} onPress={async () => {
                setIsFetching(true);
                const response = await openai.createChatCompletion({
                    model: "gpt-3.5-turbo",
                    messages: [
                        {
                            role: "system",
                            content: "You are a function getEcoFriendliness(productName: string, productDescription:string) :{ecoFriendliness: number,ecoFriendlyFeatures: string[],ecoUnfriendlyFeatures: string[]} You should return a total of at least 4 and at most 10 features.Eco Friendly score should be at a scale of 1 to 100.Your response should be only a stringified json"
                        }, {
                            role: "user",
                            content: `getEcoFriendliness("${productName}", "${productDescription}")`
                        }
                    ]
                })
                setResult(JSON.parse(response.data.choices[0].message.content))
                setIsFetching(false);
            }}/>
            {isFetching && <Text>Evaluating...</Text>}
            {!isFetching && result && <View style={{
                marginTop: 20
            }}>
                <AnimatedCircularProgress
                    size={120}
                    width={15}
                    fill={result.ecoFriendliness || 0}
                    tintColor={"#ff0000"}
                    tintColorSecondary={tintColor}
                    backgroundColor="#3d5875">
                    {
                        (fill) => (
                            <Text>
                                {fill}
                            </Text>
                        )
                    }
                </AnimatedCircularProgress>
                <>
                    {
                        result.ecoFriendlyFeatures?.map((feature, index) => {
                            return <Text key={index} style={{color: "#00ff00"}}>{feature}</Text>
                        })
                    }
                </>
                <>
                    {
                        result.ecoUnfriendlyFeatures?.map((feature, index) => {
                            return <Text key={index} style={{color: "#ff0000"}}>{feature}</Text>
                        })
                    }
                </>
            </View>
            }
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        alignItems: 'flex-start',
        justifyContent: 'flex-start',
        padding: 80
    },
});
