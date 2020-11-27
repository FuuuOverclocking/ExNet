let env = 'prod';
if (process.env.NODE_ENV !== 'production') {
    env = 'dev';
}

const monitor = {
    aaa: 123,
    env,
};

export { monitor };
