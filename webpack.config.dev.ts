import webpack from "webpack";
import { smart } from "webpack-merge";
import { COMMON_CONFIG } from "./webpack.config.common";
import path from "path";
console.log(smart)
const config = smart(COMMON_CONFIG, {
    mode: 'development',
    devtool: 'source-map',
    devServer: {
        port: 3001,
        contentBase: path.resolve(__dirname, './dist'),
        inline: true,
        overlay: true,
        hot: false
    }
})
export default config