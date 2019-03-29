package ru.grishagin.springreact.db;

import org.springframework.jdbc.core.RowMapper;

import java.sql.ResultSet;
import java.sql.SQLException;

public class EmployeeMapper implements RowMapper<Employee> {
    public Employee mapRow(ResultSet rs, int rowNum) throws SQLException {
        Employee employee = new Employee(rs.getLong("id"), rs.getString("firstName"),
                rs.getString("lastName"), rs.getString("description"), rs.getLong("timestamp"));

        return employee;
    }
}