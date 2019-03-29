package ru.grishagin.springreact.db;

import org.springframework.jdbc.core.RowMapper;

import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.Collections;
import java.util.Map;

public class AttributesMapper implements RowMapper< Map<String, String>> {
    public Map<String, String> mapRow(ResultSet rs, int rowNum) throws SQLException {
        return Collections.singletonMap(rs.getString("field"), rs.getString("name"));
    }
}
