module.exports = {

	name: 'Nodeclub', // 社区名字
	description: '仿CNode：Node.js专业中文社区', // 社区的描述
	//版块
	tabs:[{key:'share',value:'分享'},{key:'ask',value:'问答'},
		{key:'job',value:'招聘'},{key:'dev',value:'客户端测试'}],

	create_post_per_day: 1000, // 每个用户一天可以发的主题数
	create_reply_per_day: 1000, // 每个用户一天可以发的评论数
	create_user_per_ip: 1000,
	visit_per_day: 1000, // 每个 ip 每天能访问的次数

	// redis: {
	// 	host: '127.0.0.1',
	// 	port: 6379,
	// 	// db: '',
	// 	// password: '',
	// }

	// github 登陆的配置
	GITHUB_OAUTH: {
		clientID: '490d02d2f03f9cc522cf',
		clientSecret: 'a80d9e3da80262ab5f33fa4550e9694b99ee8c72',
		callbackURL: 'http://fcnode.leanapp.cn/auth/github/callback'
	},
}
