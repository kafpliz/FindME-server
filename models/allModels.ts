import { Sequelize, DataTypes, Model } from 'sequelize'
import { dbConnect } from "../config";

const sequelize = new Sequelize(dbConnect.database, dbConnect.user, dbConnect.password, {
    host: dbConnect.host,
    dialect: 'mysql',
    logging: false
})

class User extends Model { }
class Team extends Model { }
class FindBlank extends Model { }

User.init(
    {
        firstName: { type: DataTypes.STRING },
        lastName: { type: DataTypes.STRING },
        nick: { type: DataTypes.STRING, allowNull: false },
        email: { type: DataTypes.STRING },
        description: { type: DataTypes.TEXT },
        avatar: { type: DataTypes.STRING },
        password: { type: DataTypes.STRING },
        secondName: { type: DataTypes.STRING },
        roles: { type: DataTypes.STRING, defaultValue: 'user' },
        phone: { type: DataTypes.STRING },
        socialLinks: { type: DataTypes.JSON },
        refreshToken: { type: DataTypes.STRING },
        confirmEmail: { type: DataTypes.BOOLEAN },
        emailCode: { type: DataTypes.INTEGER },
        teams: { type: DataTypes.STRING },
        public: { type: DataTypes.BOOLEAN }
    },
    {
        sequelize, modelName: 'User', freezeTableName: true, tableName: 'Users', timestamps: false
    }
)
Team.init(
    {
        name: { type: DataTypes.STRING },
        description: { type: DataTypes.TEXT },
        members: { type: DataTypes.JSON },
        socialLinks: { type: DataTypes.JSON },
        nick: { type: DataTypes.STRING },
        img: { type: DataTypes.STRING },
    },
    {
        sequelize, modelName: 'Team', freezeTableName: true, tableName: 'Teams', timestamps: false
    })
FindBlank.init({
    human: { type: DataTypes.BOOLEAN },
    lastName: { type: DataTypes.STRING },
    firstName: { type: DataTypes.STRING },
    description: { type: DataTypes.TEXT },
    peculiarity: { type: DataTypes.STRING },
    img: { type: DataTypes.STRING },
    time: { type: DataTypes.INTEGER },
    found: { type: DataTypes.BOOLEAN },
    secondName: { type: DataTypes.STRING },
    isModerate: { type: DataTypes.BOOLEAN },
},
    {
        sequelize, modelName: 'FindBlank', freezeTableName: true, tableName: `human_forms`, timestamps: false
    })

export { User, Team,FindBlank }





