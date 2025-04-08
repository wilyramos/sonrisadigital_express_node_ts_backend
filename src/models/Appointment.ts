import {  Table, Column, Model, DataType, HasMany, Default, Unique, AllowNull, ForeignKey, BelongsTo} from 'sequelize-typescript';
import Medic from './Medic';
import User from './User';


@Table({
    tableName: 'appointments'
})
class Appointment extends Model {

    @ForeignKey(() => Medic)
    @AllowNull(false)
    @Column
    declare medicId: number;

    @ForeignKey(() => User)
    @AllowNull(false)
    @Column
    declare patientId: number;

    @AllowNull(false)
    @Column({
        type: DataType.DATE
    })
    declare date: Date;

    @AllowNull(false)
    @Column({
        type: DataType.STRING(100)
    })
    declare description: string;

    @AllowNull(false)
    @Column({
        type: DataType.ENUM("pending", "completed", "cancelled")
    })
    declare status: string;

    @BelongsTo(() => Medic)
    declare medic: Medic;

    @BelongsTo(() => User)
    declare patient: User;
    
}


export default Appointment;