<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
    <xsl:output indent="yes"/>
    <xsl:strip-space elements="*"/>

    <xsl:template match="node() | @*">
        <xsl:copy>
            <xsl:apply-templates select="node() | @*">
                <xsl:sort select="@id" data-type="number"/>
            </xsl:apply-templates>
        </xsl:copy>
    </xsl:template>
    
    <xsl:template match="//*[@v]">
        <xsl:element name="{local-name()}" namespace="{namespace-uri()}">
            <xsl:attribute name="k">
                <xsl:value-of select="@k"/>
            </xsl:attribute>
            <xsl:attribute name="v">
                <xsl:value-of select="@v"/>
            </xsl:attribute>
        </xsl:element>
        <xsl:copy-of select="node()"/>
    </xsl:template>

</xsl:stylesheet>
