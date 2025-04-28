import {  Table, Column, Model, DataType, HasMany, Default, Unique, AllowNull} from 'sequelize-typescript';
import Appointment from './Appointment';
import MedicalRecord from './MedicalRecord';

@Table({
    tableName: 'users'
})

class User extends Model {

    @AllowNull(false)
    @Column({
        type: DataType.STRING(50)
    })
    declare name: string;

    @AllowNull(false)
    @Unique(true)
    @Column({
        type: DataType.STRING(50)
    })
    declare email: string;

    @AllowNull(false)
    @Column({
        type: DataType.STRING(100)
    })
    declare password: string;

    @Default(null)
    @AllowNull(true)
    @Column({
        type: DataType.STRING(20)
    })
    declare phone: string;
    

    @Default("admin")
    @AllowNull(false)
    @Column({
        type: DataType.ENUM("paciente", "admin")
    })
    declare role: "paciente" | "admin";

    // Relations

    @HasMany(() => Appointment)
    declare appointments: Appointment[];

    @HasMany(() => MedicalRecord)
    declare medicalRecords: MedicalRecord[];
}

export default User;