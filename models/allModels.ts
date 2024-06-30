import { Sequelize, DataTypes, Model } from 'sequelize'
import { dbConnect } from "../config";

    const sequelize = new Sequelize(dbConnect.database, dbConnect.user, dbConnect.password, {
        host: dbConnect.host,
        dialect: 'mysql',
        logging: false
    })

    class User extends Model { }

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
            emailCode: { type: DataTypes.INTEGER  },
            teams: { type: DataTypes.STRING },
            public: { type: DataTypes.BOOLEAN }
        },
        {
            sequelize, modelName: 'User', freezeTableName: true, tableName: 'Users',timestamps: false
        }
    )

    
export {User}


        
       

