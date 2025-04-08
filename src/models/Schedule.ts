import {  Table, Column, Model, DataType, HasMany, Default, Unique, AllowNull, ForeignKey, BelongsTo} from 'sequelize-typescript';
import Medic from './Medic';


@Table({
    tableName: 'schedules'
})
class Schedule extends Model {

    @ForeignKey(() => Medic)
    @AllowNull(false)
    @Column
    declare medicId: number;

    @AllowNull(false)
    @Column({
        type: DataType.ENUM("Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday")
    })
    declare day: string;

    @AllowNull(false)
    @Column({
        type: DataType.TIME 
    })
    declare start: string;

    @AllowNull(false)
    @Column({
        type: DataType.TIME
    })
    declare end: string;

    @BelongsTo(() => Medic)
    declare medic: Medic;
}


export default Schedule